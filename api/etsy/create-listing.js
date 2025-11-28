import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id, listing_id, title, price, quantity, image, description } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  if (!title || !price) {
    return res.status(400).json({ error: 'Title and price are required' });
  }

  try {
    // Get Etsy tokens from database
    const { data: tokenData, error: tokenError } = await supabase
      .from('etsy_tokens')
      .select('access_token, shop_id')
      .eq('user_id', user_id)
      .single();

    if (tokenError || !tokenData) {
      return res.status(401).json({ error: 'Etsy account not connected. Please connect your Etsy account first.' });
    }

    const { access_token, shop_id } = tokenData;

    if (!shop_id) {
      return res.status(400).json({ error: 'Shop ID not found. Please reconnect your Etsy account.' });
    }

    // Prepare listing data for Etsy
    const listingData = {
      quantity: quantity || 1,
      title: title.substring(0, 140), // Etsy max title length is 140
      description: description || title,
      price: price,
      who_made: 'i_did', // Required field - can be: i_did, someone_else, collective
      when_made: '2020_2024', // Required field - can be: made_to_order, 2020_2024, 2010_2019, etc.
      taxonomy_id: 2000, // Default category - you might want to make this dynamic
      shipping_profile_id: null, // Will need to be set
      return_policy_id: null, // Will need to be set
      type: 'physical', // physical or download
      is_supply: false,
      is_customizable: false,
      should_auto_renew: true,
      state: 'draft' // Start as draft - can be 'active' or 'draft'
    };

    // Create the listing on Etsy
    const createListingResponse = await fetch(
      `https://openapi.etsy.com/v3/application/shops/${shop_id}/listings`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          'x-api-key': process.env.ETSY_API_KEY
        },
        body: JSON.stringify(listingData)
      }
    );

    if (!createListingResponse.ok) {
      const errorData = await createListingResponse.json();
      console.error('Etsy API Error:', errorData);
      
      // Handle token expiration
      if (createListingResponse.status === 401) {
        return res.status(401).json({ 
          error: 'Etsy authentication expired. Please reconnect your Etsy account.',
          shouldReconnect: true 
        });
      }

      return res.status(createListingResponse.status).json({ 
        error: errorData.error || 'Failed to create listing on Etsy',
        details: errorData
      });
    }

    const etsyListing = await createListingResponse.json();
    const etsyListingId = etsyListing.listing_id;

    // Upload image if available
    if (image && etsyListingId) {
      try {
        // Download the image from the URL
        const imageResponse = await fetch(image);
        const imageBlob = await imageResponse.blob();
        
        // Create form data for image upload
        const formData = new FormData();
        formData.append('image', imageBlob);
        formData.append('rank', '1');
        formData.append('overwrite', 'true');
        formData.append('is_watermarked', 'false');

        // Upload image to Etsy
        const uploadImageResponse = await fetch(
          `https://openapi.etsy.com/v3/application/shops/${shop_id}/listings/${etsyListingId}/images`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${access_token}`,
              'x-api-key': process.env.ETSY_API_KEY
            },
            body: formData
          }
        );

        if (!uploadImageResponse.ok) {
          console.error('Failed to upload image to Etsy listing');
        }
      } catch (imageError) {
        console.error('Error uploading image:', imageError);
        // Continue anyway - listing was created
      }
    }

    // Store the Etsy listing in your database
    const { error: dbError } = await supabase
      .from('etsy_listings')
      .insert({
        user_id,
        listing_id: etsyListingId,
        ebay_listing_id: listing_id,
        title,
        price,
        quantity,
        state: etsyListing.state,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('Failed to save listing to database:', dbError);
    }

    // Update the eBay listing to mark it as listed on Etsy
    const { error: updateError } = await supabase
      .from('ebay_listings')
      .update({ 
        listed_on_etsy: true,
        etsy_listing_id: etsyListingId,
        updated_at: new Date().toISOString()
      })
      .eq('listing_id', listing_id)
      .eq('user_id', user_id);

    if (updateError) {
      console.error('Failed to update eBay listing:', updateError);
    }

    return res.status(200).json({
      success: true,
      listing_id: etsyListingId,
      message: 'Successfully created listing on Etsy',
      etsy_url: `https://www.etsy.com/listing/${etsyListingId}`
    });

  } catch (error) {
    console.error('Error creating Etsy listing:', error);
    return res.status(500).json({ 
      error: 'Failed to create listing on Etsy',
      details: error.message 
    });
  }
}
