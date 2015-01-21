require 'fileutils'
require 'active_support/multibyte'

def remote_name
  ENV.fetch("REMOTE_NAME", "origin")
end

PROJECT_ROOT = `git rev-parse --show-toplevel`.strip
BUILD_DIR    = File.join(PROJECT_ROOT, "build")
GH_PAGES_REF = File.join(BUILD_DIR, ".git/refs/remotes/#{remote_name}/master")

directory BUILD_DIR

# Fetch upstream changes on gh-pages branch
task :sync do
  cd BUILD_DIR do
    sh "git fetch #{remote_name}"
    sh "git reset --hard #{remote_name}/master"
  end
end

# Prevent accidental publishing before committing changes
task :not_dirty do
  puts "***#{ENV['ALLOW_DIRTY']}***"
  unless ENV['ALLOW_DIRTY']
    fail "Directory not clean" if /nothing to commit/ !~ `git status`
  end
end

desc "Compile all files into the build directory"
task :build do
  cd PROJECT_ROOT do
    sh "bundle exec middleman build --clean"
  end
end

desc "Build and publish to Github Pages"
task :publish => [:not_dirty, :sync, :build] do
  message = nil
  suffix = ENV["COMMIT_MESSAGE_SUFFIX"]

  cd PROJECT_ROOT do
    head = `git log --pretty="%h" -n1`.strip
    message = ["Site updated to #{head}", suffix].compact.join("\n\n")
  end

  cd BUILD_DIR do
    sh 'git add --all'
    if /nothing to commit/ =~ `git status`
      puts "No changes to commit."
    else
      sh "git commit -m \"#{message}\""
    end
    sh "git push #{remote_name} master"
  end
end

task :post, [:category, :title] do | t, args |
  category = args[:category]
  title = args[:title]

  slug = ActiveSupport::Multibyte.proxy_class.new(title.to_s).normalize(:kc).
      gsub(/[\W]/, ' ').
      strip.
      gsub(/\s+/, '-').
      gsub(/-\z/, '').
      downcase.
      to_s

  require 'erb'
  require 'ostruct'
  namespace = OpenStruct.new(title: title, category: category)
  template_path = File.expand_path("../template_post.erb", __FILE__)
  post_path = File.expand_path("../source/blog/#{category}/#{slug}.markdown", __FILE__)
  if File.exists?(post_path)
    puts "Sorry! #{post_path} already exists"
  else
    rendered_content = ERB.new(File.new(template_path).read).result(namespace.instance_eval { binding })
    File.open(post_path, 'w') { |file| file.write(rendered_content) }
    puts "#{post_path} created"
    `open -a "iA Writer" #{post_path}`
  end
end
