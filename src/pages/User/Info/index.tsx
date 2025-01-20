
interface UserInfoProps {
  t: (key: string) => string;
}

function UserInfo({ t }: UserInfoProps) {

  return (
    <div>
      <h1>{t('userInfo')}</h1>
      <p>{t('userList')}</p>
    </div>
  );
}

export default UserInfo;