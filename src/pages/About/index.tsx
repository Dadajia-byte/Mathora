
interface AboutProps {
  t: (key: string) => string;
}

function About({ t }: AboutProps) {

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      <h1>{t('home')}</h1>

    </div>
  );
}

export default About;