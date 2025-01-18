
interface AboutProps {
  t: (key: string) => string;
}

function About({ t }: AboutProps) {
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>

      
    </div>
  );
}

export default About;