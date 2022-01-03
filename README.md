[![CI](https://github.com/gizumon/life-manager-app-react/actions/workflows/ci.yml/badge.svg)](https://github.com/gizumon/life-manager-app-react/actions/workflows/ci.yml)

# Life-manager-app

This application will support your life with your partner on the LINE platform.  
Currently, there are three features in this application mainly.

- PAY
  - Manage how much you and your partner pay.
  - Reduce the amount of real-world money transactions by managing payments with data.
- ToBuy
  - Manage a shopping list shared by you and your partner.
- ToDo
  - Manage a task list shared by you and your partner.

<br>

![app-demo](./docs/app-demo.gif)

<br>

## Environment

__Run Environment (Reference)__

- Node v12.20.1
- Yarn 1.22.10

__Libraries__

- Next.js v10.2.0
- React.js v17.0.2
- [Line frontend framework (LIFF)](https://developers.line.biz/ja/reference/liff/)
- [Firebase Realtime database](https://firebase.google.com/docs/database?hl=ja)

<br>

__theme__

- Theme color: #1995ad

## How to run in local environment

1. Install node dependencies

```bash
npm install
```

2. Run on docker-compose environment

```
docker-compose up
```

<br>

## How to deploy

### Deploy command

```bash
git push origin main
```

Run deploy heroku triggered by push main branch

<br>

### Server setting

Set variables.

|Name|Explanation|Other|
|---|---|---|
|FIREBASE_API_KEY|[Firebase API key](https://firebase.google.com/docs/projects/api-keys?hl=ja)||
|LIFF_ID|[Liff ID](https://developers.line.biz/ja/reference/liff/#initialize-liff-app)||
|CHANNEL_ACCESS_TOKEN|[Line chanel access token](https://developers.line.biz/ja/docs/messaging-api/channel-access-tokens/)||
|CHANNEL_SECRET|[Line chanel secret](https://developers.line.biz/ja/glossary/#channel-secret)||
|NODE_ENV|"production"||
|NPM_CONFIG_PRODUCTION|false||

```bash
next start -p $PORT
```

<br>

## Idea

* [ ] Add priority for ToDo/ToBuy list and pop up notify if the priority is high
* [ ] Notify LINE group
* [ ] Custom theme edited from UI
* [ ] Sort feature
* [ ] Edit record feature
* [ ] Move type with Swipe

<br>

<details><summary>Other</summary>

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

</details>
