import withTranslation from '@/hocs/withTranslation';

interface HomeProps {
  t: (key: string) => string;
}

function Home({ t }: HomeProps) {
  return (
    <div>
      <h1>{t('home')}</h1>
      <p>{t('test')}</p>
    </div>
  );
}

export default withTranslation(Home);