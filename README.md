# PCDeals.Server


## EC2

### Connect
```bash
ssh -i  <pem> ubuntu@<public-dns>
```

#### Online-shell
http://ec2-52-34-198-84.us-west-2.compute.amazonaws.com:5000/

- Username: build
- Password: build

##### Useful Commands

```bash
pm2 list # see running apps
pm2 monit # watch deployment occur live
pm2 logs # live log viewer
pm2 restart <app_name>  # restart specific app/branch
pm2 restart all # restart all apps/branches
pm2 kill # never do this please! conflicts with branch-off atm

htop # activity monitor; press t for accessing sub-processes

cd ~/Github/Entree.Server # root repo directory
cd ~/Github/Entree.Server && npm install # reinstall the modules for the app
npm cache clear # if modules need to be downloaded again
```

### Setup
```bash
# general env setup
sudo apt-get update
sudo apt-get install git
sudo apt-get -y install build-essential
echo "sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 3000" >> ~/.bashrc
echo "export PORT=3000" >> ~/.bashrc

# node via. nvm
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.29.0/install.sh | bash
source ~/.bashrc
nvm install 5.0.0
echo "echo 'Shitty solution but whatevs' && nvm install 5.0.0" >> ~/.bashrc # fix me in the future

# node global
npm install pm2 -g
pm2 install pm2-webshell
pm2 conf pm2-webshell:port 5000
pm2 conf pm2-webshell:username build
pm2 conf pm2-webshell:password build
npm install grunt-cli -g

# sass engine
sudo apt-get -y install ruby
sudo gem install sass

# clone
git config --global credential.helper store
mkdir Github && cd Github
git clone https://github.com/PCDeals/PCDeals.Server && cd PCDeals.Server

# install app dependencies
npm install

# launch app with branch-off
./node_modules/branch-off/dist/cli
```

