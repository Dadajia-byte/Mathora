import { useNavigate } from 'react-router-dom'; // 用于跳转路由
import i18n from '@/i18n';
import request from '@/services/request';
interface HomeProps {
  t: (key: string) => string;
}

function Home({ t }: HomeProps) {
  const navigate = useNavigate(); // 获取跳转方法

  const test1 = async () => {
    // 测试一下缓存功能
    const res = await request.post('/test1', {
      data: {
        name: 'test1'
      },
      cache: true, // 开启缓存
    },
    )
    console.log(res);
  }


  // 切换语言的函数
  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language); // 切换语言
  };
  return (
    <div>
      <h1>{t('home')}</h1>
      <p>{t('test')}</p>
      {/* 跳转到 About 路由 */}
      <button onClick={() => navigate('/about')}>{t('goToAbout')}</button>

      {/* 切换语言 */}
      <div>
        <button onClick={() => changeLanguage('en-US')}>{t('english')}</button>
        <button onClick={() => changeLanguage('zh-CN')}>{t('chinese')}</button>
      </div>
      <button onClick={() => test1()}>测试</button>
    </div>
  );
}

export default Home;