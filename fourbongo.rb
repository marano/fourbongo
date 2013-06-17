path = File.expand_path(File.join(File.dirname(__FILE__)))
$LOAD_PATH << path

require 'rubygems'
require 'bundler'
Bundler.require :default

require 'yaml'

CONFIG = YAML.load_file('config/env.yml')[Sinatra::Application.environment.to_s]

Twitter.configure do |config|
  config.consumer_key = 'qAb5J3UuDgVG4Xd10VA'
  config.consumer_secret = 'ArxTdVamSwk5WufcObfqMtVDy6QQa5tBf6ZGlN7RDSw'
  config.oauth_token = '15903657-P0aYbGZSi3NJygkAvt2ZTRs3lswKq2Adv1JE8v2I'
  config.oauth_token_secret = 'OKxGyuWxAqdLAvnrx4ejJEbURMQDYJ6kJwNA9CYxg8'
end

set :app_file, __FILE__

Dir['lib/**/*.rb'].each { |file| require file }
