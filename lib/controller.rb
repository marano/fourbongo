# encoding: utf-8

enable :sessions
set :session_secret, "foajalkjsdfhkljashdfkashdfh"

use OmniAuth::Builder do
  provider :twitter, CONFIG['twitter_consumer_key'], CONFIG['twitter_consumer_secret']
  provider :foursquare, CONFIG['foursquare_client_id'], CONFIG['foursquare_client_secret']
  provider :instagram, CONFIG['instagram_client_id'], CONFIG['instagram_client_secret']
  provider :flickr, CONFIG['flickr_app_key'], CONFIG['flickr_app_secret'], :scope => 'read'
end

def twitter
  if session[:twitter_access_token]
    Twitter::Client.new(
      :oauth_token => session[:twitter_access_token],
      :oauth_token_secret => session[:twitter_access_secret]
    )
  else
    credentials = TWITTER_CREDENTIALS.sample
    Twitter::Client.new(
      :consumer_key => credentials[:consumer_key],
      :consumer_secret => credentials[:consumer_secret],
      :oauth_token => credentials[:oauth_token],
      :oauth_token_secret => credentials[:oauth_token_secret]
    )
  end
end

get '/' do
  @catchphrase = BRASIL_CATCHPHRASES.randomize.first
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
  return_to_or_home(session)
end

get '/auth/instagram/callback' do
  response.set_cookie :instagram_authenticated, { :value => true, :path => '/' }
  response.set_cookie :instagram_access_token, { :value => request.env['omniauth.auth']['credentials']['token'], :path => '/' }
  return_to_or_home(session)
end

get '/auth/flickr/callback' do
  response.set_cookie :flickr_authenticated, { :value => true, :path => '/' }
  response.set_cookie :flickr_access_token, { :value => request.env['omniauth.auth']['credentials']['token'], :path => '/' }
  return_to_or_home(session)
end

put '/return_to' do
  session[:return_to] = params[:location]
  status 204
end

def return_to_or_home(session)
  if (session.has_key? :return_to)
    redirect '/#' + session.delete(:return_to)
  else
    redirect '/'
  end
end

get '/foursquare/authentication_menu' do
  erb :foursquare_authentication_menu
end

get '/twitter/search_by_location' do
  twitter.search('', :geocode => "#{params[:latitude]},#{params[:longitude]},10km", :result_type => 'recent', :count => 100, :include_entities => true).results.map { |result| result.attrs }.to_json
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

BRASIL_CATCHPHRASES = [
  'não é por causa de vinte centavos',
  'quero ver na copa',
  'o gigante acordou',
  'não se faz país sem hospital',
  'mané é quem gasta 20 bilhões num estádio de futebol',
  'amanhã vai ser maior',
  'tacaram mentos na geração coca cola',
  'vai pra pec que te pariu',
  'verás que o filho teu não foge a luta',
  'enfia os 20 centavos no SUS',
  'versão vinagre'
]

CATCHPHRASES = [
  'see the buzz around you',
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
  'see duckfaces around you'
]
