FROM cypress/included:cypress-15.11.0-node-24.14.0-chrome-145.0.7632.116-1-ff-148.0-edge-145.0.3800.70-1

WORKDIR /opt/app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["cypress", "run", "--spec", "cypress/e2e/preland/**/*"]