APP_SERVER = "fourbongo.com"
#$:.unshift(File.expand_path('./lib', ENV['rvm_path']))
require 'rvm/capistrano'

set :application, "fourbongo"
set :user, "unicorn"
set :branch, "master"
set :scm, :git

role :app, APP_SERVER
role :web, APP_SERVER

set :rvm_ruby_string, 'ree@fourbongo'
set :deploy_to, "/var/www/#{application}"
set :repository,  "git@fourbongo.com:fourbongo.git"
set :unicorn_config, "#{current_path}/config/unicorn.rb"
set :unicorn_pid, "/tmp/nyumba.pid"

namespace :deploy do
  task :start, :roles => :app, :except => { :no_release => true } do 
    run "cd #{current_path} && bundle exec unicorn -c #{unicorn_config} -E production -D"
  end
  task :stop, :roles => :app, :except => { :no_release => true } do 
    run "kill `cat #{unicorn_pid}`"
  end
  task :graceful_stop, :roles => :app, :except => { :no_release => true } do
    run "kill -s QUIT `cat #{unicorn_pid}`"
  end
  task :reload, :roles => :app, :except => { :no_release => true } do
    run "kill -s USR2 `cat #{unicorn_pid}`"
  end
  task :restart, :roles => :app, :except => { :no_release => true } do
    stop
    start
  end
end
