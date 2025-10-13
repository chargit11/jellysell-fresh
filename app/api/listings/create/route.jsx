// app/api/listings/create/route.js
import { NextResponse } from 'next/server';

const SUPABASE_URL = 'https://qvhjmzdavsbauugubfcm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2aGptemRhdnNiYXV1Z3ViZmNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MDk4NzUsImV4cCI6MjA3NTI4NTg3NX0.rKnW3buNrTrQVWkvXlplX0Y1BUpoJ4AVv04D5x8zyVw';

export async function POST(request) {
  console.log('CREATE LISTING API CALLED');
  
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    const { user_id, title, description, price, quantity, condition, images, type, vendor, tags, category } = body;

    if (!user_id || !title || !price) {
      return NextResponse.json({ error: 'Missing required fields: user_id, title, price' }, { status: 400 });
    }

    // 1. Get user's eBay token
    console.log('Fetching eBay token for user:', user_id);
    const tokenResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/user_tokens?user_id=eq.${user_id}&platform=eq.ebay&select=*`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const tokens = await tokenResponse.json();
    console.log('Tokens found:', tokens?.length || 0);
    
    if (!tokens || tokens.length === 0) {
      return NextResponse.json({ 
        error: 'eBay not connected. Please connect your eBay account first using the Chrome extension.' 
      }, { status: 401 });
    }

    const ebayToken = tokens[0].access_token;

    // 2. Create listing on eBay using Trading API
    console.log('Creating eBay listing...');
    
    const categoryID = getCategoryID(category);
    
    const xmlPayload = `<?xml version="1.0" encoding="utf-8"?>
<AddFixedPriceItemRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials>
    <eBayAuthToken>${ebayToken}</eBayAuthToken>
  </RequesterCredentials>
  <ErrorLanguage>en_US</ErrorLanguage>
  <WarningLevel>High</WarningLevel>
  <Item>
    <Title>${escapeXml(title)}</Title>
    <Description><![CDATA[${description || 'No description provided'}]]></Description>
    <PrimaryCategory>
      <CategoryID>${categoryID}</CategoryID>
    </PrimaryCategory>
    <StartPrice>${price}</StartPrice>
    <CategoryMappingAllowed>true</CategoryMappingAllowed>
    <ConditionID>${getConditionID(condition)}</ConditionID>
    <Country>US</Country>
    <Currency>USD</Currency>
    <DispatchTimeMax>3</DispatchTimeMax>
    <ListingDuration>GTC</ListingDuration>
    <ListingType>FixedPriceItem</ListingType>
    <PaymentMethods>PayPal</PaymentMethods>
    <PayPalEmailAddress>seller@example.com</PayPalEmailAddress>
    ${images && images.length > 0 ? images.slice(0, 12).map(img => `<PictureDetails><PictureURL>${img}</PictureURL></PictureDetails>`).join('') : ''}
    <PostalCode>10001</PostalCode>
    <Quantity>${quantity}</Quantity>
    <ReturnPolicy>
      <ReturnsAcceptedOption>ReturnsAccepted</ReturnsAcceptedOption>
      <RefundOption>MoneyBack</RefundOption>
      <ReturnsWithinOption>Days_30</ReturnsWithinOption>
      <ShippingCostPaidByOption>Buyer</ShippingCostPaidByOption>
    </ReturnPolicy>
    <ShippingDetails>
      <ShippingType>Flat</ShippingType>
      <ShippingServiceOptions>
        <ShippingServicePriority>1</ShippingServicePriority>
        <ShippingService>USPSMedia</ShippingService>
        <ShippingServiceCost>2.50</ShippingServiceCost>
      </ShippingServiceOptions>
    </ShippingDetails>
    <Site>US</Site>
  </Item>
</AddFixedPriceItemRequest>`;

    const ebayResponse = await fetch('https://api.ebay.com/ws/api.dll', {
      method: 'POST',
      headers: {
        'X-EBAY-API-SITEID': '0',
        'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
        'X-EBAY-API-CALL-NAME': 'AddFixedPriceItem',
        'Content-Type': 'text/xml'
      },
      body: xmlPayload
    });

    const responseText = await ebayResponse.text();
    console.log('eBay response (first 500 chars):', responseText.substring(0, 500));

    // Check if successful
    if (responseText.includes('<Ack>Success</Ack>') || responseText.includes('<Ack>Warning</Ack>')) {
      // Extract ItemID
      const itemIdMatch = responseText.match(/<ItemID>(.*?)<\/ItemID>/);
      const itemId = itemIdMatch ? itemIdMatch[1] : null;

      console.log('Successfully created eBay listing:', itemId);

      // 3. Save to Supabase for tracking
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/listings`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            user_id,
            title,
            description,
            price,
            quantity,
            condition,
            ebay_item_id: itemId,
            platform: 'ebay',
            status: 'active',
            created_at: new Date().toISOString()
          })
        });
      } catch (dbError) {
        console.error('Failed to save to database, but listing was created on eBay:', dbError);
      }

      return NextResponse.json({
        success: true,
        itemId,
        message: 'Successfully listed on eBay!'
      });
    } else {
      // Extract error
      const errorMatch = responseText.match(/<LongMessage>(.*?)<\/LongMessage>/);
      const shortErrorMatch = responseText.match(/<ShortMessage>(.*?)<\/ShortMessage>/);
      const errorMessage = errorMatch ? errorMatch[1] : (shortErrorMatch ? shortErrorMatch[1] : 'eBay API returned error');
      
      console.error('eBay API error:', errorMessage);
      
      return NextResponse.json({ 
        error: errorMessage,
        details: responseText.substring(0, 1000)
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Create listing error:', error);
    return NextResponse.json({ 
      error: 'Failed to create listing',
      details: error.message 
    }, { status: 500 });
  }
}

function escapeXml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getConditionID(condition) {
  const conditionMap = {
    'NEW': '1000',
    'LIKE_NEW': '1500',
    'USED_EXCELLENT': '2000',
    'USED_GOOD': '2500',
    'USED_ACCEPTABLE': '3000'
  };
  return conditionMap[condition] || '1000';
}

function getCategoryID(category) {
  const categoryMap = {
    'clothing': '11450',
    'electronics': '293',
    'home': '11700',
    'collectibles': '1',
    'sporting': '888',
    'toys': '220',
    'books': '267',
    'jewelry': '281'
  };
  return categoryMap[category] || '260'; // Default to general category
}
