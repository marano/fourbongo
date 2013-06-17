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

TWITTER_CREDENTIALS = [{
  :consumer_key =>'qAb5J3UuDgVG4Xd10VA',
  :consumer_secret => 'ArxTdVamSwk5WufcObfqMtVDy6QQa5tBf6ZGlN7RDSw',
  :oauth_token => '15903657-P0aYbGZSi3NJygkAvt2ZTRs3lswKq2Adv1JE8v2I',
  :oauth_token_secret => 'OKxGyuWxAqdLAvnrx4ejJEbURMQDYJ6kJwNA9CYxg8'
}, {
  :consumer_key =>'47SOyTBpmqI7a9LHSIoiAg',
  :consumer_secret => '0q6WEECClR8rLGBrBsU8njqmPBTRZHwb24fIbvQk',
  :oauth_token => '15903657-RNusGPmGa8AlYTSydZJOm9k9yEhUzOMcXFsDJnAlc',
  :oauth_token_secret => 'FthwBXAO4cov0hiyV4wzKufClyUHpgFq19kQIWvtU'
}, {
  :consumer_key =>'Q2Q4M2zZ7Yz9HE9q42bg',
  :consumer_secret => 'Ty7FsGva3WFlgtaY9QQIvceV013fWETbOeOpqG5pIo',
  :oauth_token => '15903657-oTYJzhoRUlJFEoARlo6Axli32zndYzP9IMyg0oGjc',
  :oauth_token_secret => '0LzCsYaSNdo9hqvvMIfhc7gYFksrG56g8OmWpbe7mvE'
}]

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
