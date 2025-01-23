import { useNavigate } from "react-router-dom"; // 用于跳转路由
import i18n from "@/i18n";
import { useSelector } from "react-redux"; // 用于获取 Redux 状态
interface AboutProps {
  t: (key: string) => string;
}

function About({ t }: AboutProps) {
  const navigate = useNavigate(); // 获取跳转方法

  // 切换语言的函数
  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language); // 切换语言
  };
  //获取Store状态
  const { username } = useSelector((state: any) => state.user);

  return (
    <div>
      <p className="h-[16px]">{username}</p>
      <h1>{t("About")}</h1>
      <p>{t("test")}</p>
      {/* 跳转到 About 路由 */}
      <button onClick={() => navigate("/")}>{t("goToAbout")}</button>

      {/* 切换语言 */}
      <div>
        <button onClick={() => changeLanguage("en-US")}>{t("english")}</button>
        <button onClick={() => changeLanguage("zh-CN")}>{t("chinese")}</button>
      </div>
    </div>
  );
}

export default About;
