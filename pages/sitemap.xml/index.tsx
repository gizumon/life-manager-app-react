import {getServerSideSitemap, ISitemapField} from 'next-sitemap';
import {GetServerSideProps} from 'next';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const fields: ISitemapField[] = [];
  return getServerSideSitemap(ctx, fields);
};

// Default export to prevent next.js errors
export default () => {};
