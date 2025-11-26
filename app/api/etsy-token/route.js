export async function POST(req) {
  try {
    const { code, redirect_uri, client_id, code_verifier } = await req.json();
    
    const tokenResponse = await fetch('https://api.etsy.com/v3/public/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: client_id,
        redirect_uri: redirect_uri,
        code: code,
        code_verifier: code_verifier
      })
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      return new Response(errorText, { status: tokenResponse.status });
    }
    
    const tokens = await tokenResponse.json();
    
    return Response.json({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
