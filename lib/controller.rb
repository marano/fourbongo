get '/' do
  @catchphrase = CATCHPHRASES.randomize.first
  @from_foursquare_authentication_callback = false
  erb :index
end

get '/foursquare/authentication_callback' do
  @catchphrase = CATCHPHRASES.randomize.first
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

get '/twitter/search' do
  Twitter.search("#{params[:query]}", :result_type => 'recent', :count => 100, :include_entities => true).results.map { |result| result.attrs }.to_json
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
