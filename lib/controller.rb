get '/' do
  @from_foursquare_authentication_callback = false
  erb :index
end

get '/foursquare/authentication_callback' do
  @from_foursquare_authentication_callback = true
  erb :index
end

get '/search_menu' do
  erb :search_menu
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

get '/venues/search_by_name_and_city/:name/:city' do
  content_type :json
  Foursquare.new.search_venues_by_name_and_city(params[:name], params[:city]).to_json
end
