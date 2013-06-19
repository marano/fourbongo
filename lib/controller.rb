enable :sessions
set :session_secret, "foajalkjsdfhkljashdfkashdfh"

use OmniAuth::Builder do
  provider :twitter, CONFIG['twitter_consumer_key'], CONFIG['twitter_consumer_secret']
  provider :foursquare, CONFIG['foursquare_client_id'], CONFIG['foursquare_client_secret']
  provider :instagram, CONFIG['instagram_client_id'], CONFIG['instagram_client_secret']
  provider :flickr, CONFIG['flickr_app_key'], CONFIG['flickr_app_secret'], :scope => 'read'
end

get '/' do
  @catchphrase = CATCHPHRASES.randomize.first
  @from_foursquare_authentication_callback = params[:from_foursquare_authentication_callback]
  erb :index
end

get '/auth/foursquare/callback' do
  response.set_cookie :foursquare_authenticated, { :value => true, :path => '/' }
  response.set_cookie :foursquare_access_token,  { :value => request.env['omniauth.auth']['credentials']['token'], :path => '/' }
  redirect '/?from_foursquare_authentication_callback=true'
end

get '/auth/twitter/callback' do
  response.set_cookie :twitter_authenticated, { :value => true, :path => '/' }
  session[:twitter_access_token] = request.env['omniauth.auth']['credentials']['token']
  session[:twitter_access_secret] = request.env['omniauth.auth']['credentials']['secret']
  redirect '/'
end

get '/auth/instagram/callback' do
  response.set_cookie :instagram_authenticated, { :value => true, :path => '/' }
  response.set_cookie :instagram_access_token, { :value => request.env['omniauth.auth']['credentials']['token'], :path => '/' }
  redirect '/'
end

get '/auth/flickr/callback' do
  response.set_cookie :flickr_authenticated, { :value => true, :path => '/' }
  response.set_cookie :flickr_access_token, { :value => request.env['omniauth.auth']['credentials']['token'], :path => '/' }
  redirect '/'
end

get '/settings' do
  erb :settings
end

get '/foursquare/authentication_menu' do
  erb :foursquare_authentication_menu
end

get '/facebook/authentication_menu' do
  erb :facebook_authentication_menu
end

get '/twitter/search' do
  twitter.search("#{params[:query]}", :result_type => 'recent', :count => 100, :include_entities => true).results.map { |result| result.attrs }.to_json
end

class Array
  def randomize
    duplicated_original = self.dup
    new_array = self.class.new
    new_array << duplicated_original.slice!(rand(duplicated_original.size)) until new_array.size.eql?(self.size)
    return new_array
  end

  def randomize!
    self.replace(randomize)
  end
end

def twitter
  credentials = TWITTER_CREDENTIALS.sample
  client = Twitter::Client.new(
    :consumer_key => credentials[:consumer_key],
    :consumer_secret => credentials[:consumer_secret],
    :oauth_token => credentials[:oauth_token],
    :oauth_token_secret => credentials[:oauth_token_secret]
  )
end

CATCHPHRASES = ['see the buzz around you',
                'see the buzz around you',
                'see the buzz around you',
                'see the buzz around you',
                'see the buzz around you',
                'see the buzz around you',
                'the real life news',
                'the real life news',
                'the real life news',
                'the real life news',
                'the real life news',
                'the real life news',
                'the democratic news',
                'the democratic news',
                'the democratic news',
                'the democratic news',
                'live!',
                'pop',
                'what do you think?',
                'the rest are lies',
                'this is a virtual world',
                'see duckfaces around you']
