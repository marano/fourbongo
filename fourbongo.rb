path = File.expand_path(File.join(File.dirname(__FILE__)))
$LOAD_PATH << path

require 'rubygems'
require 'bundler'
Bundler.require :default

require 'yaml'

CONFIG = YAML.load_file('config/env.yml')[Sinatra::Application.environment.to_s]

Twitter.configure do |config|
  config.consumer_key = CONFIG['twitter_consumer_key']
  config.consumer_secret = CONFIG['twitter_consumer_secret']
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

set :app_file, __FILE__

Dir['lib/**/*.rb'].each { |file| require file }
