module.exports = {
  apps: [
    {
      name: 'core',
      script: 'npm',
      args: 'run start',
    },
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
