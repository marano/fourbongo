require 'rubygems'
require 'fourbongo'

Bundler.require :test

RSpec.configure do |config|
  config.extend VCR::RSpec::Macros

  config.before :suite do
    VCR.config do |vcr_config|
      vcr_config.cassette_library_dir = 'spec/fixtures/vcr'
      vcr_config.stub_with :fakeweb
    end
  end
end
