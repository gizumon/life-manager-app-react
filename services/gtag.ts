import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();


console.log(publicRuntimeConfig);
export const GA_ID = publicRuntimeConfig.GA_ID || '';
export const existsGaId = GA_ID !== '';

export const pageView = (url: string): void => {
  if (!existsGaId) return;
  window.gtag('config', GA_ID, { page_path: url });
};

export const event = ({action, category, label, value = ''}) => {
  if (!existsGaId) {
    return;
  }

  window.gtag('event', action, {
    event_category: category,
    event_label: JSON.stringify(label),
    value,
  });
};
