module.exports = {
  apps: [
    {
      name: "crowdfund-next",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "700M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
