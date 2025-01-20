import { Outlet } from 'react-router-dom';


interface UserProps {
  t: (key: string) => string;
}

function User({ t }: UserProps) {

  return (
    <div>
      <h1>{t('user')}</h1>
      <p>{t('childrenrouter')}</p>
      <h1>{t('test')}</h1>
      <Outlet />
    </div>
  );
}

export default User;