module.exports = {
  apps: [
    {
      name: 'telegram',
      script: 'npm',
      args: 'run start:telegram',
    },
    {
      name: 'scrapper',
      script: 'npm',
      args: 'run start:scrapper',
    },
  ],
};
