// import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { LoginForm } from "./loginForm/index.tsx";
import { VerifyForm } from "./verifyForm/index.tsx";
import clsx from "clsx";
interface HomeProps {
  t: (key: string) => string;
}

function Home({  }: HomeProps) {


  const [currentStep, setCurrentStep] = useState(0); // 用于切换步骤
  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  return (
    <div>
      <div className="h-[1080px] w-[1920px] bg-[#020817] flex">
        {/* 左半边 */}
        <div className="flex-col w-1/2 ml-[182px] mt-[86px] ">
          <div className="flex items-center content-center ">
            <div className="h-[48.25px] w-[27.58px] mr-[25.42px]  bg-no-repeat bg-contain bg-center bg-[url('@/assets/images/Logo.png')]"></div>
            <div className="h-[75px] w-[226px]  bg-no-repeat bg-contain bg-center bg-[url('@/assets/images/Mathora.png')]"></div>
          </div>
          <div className="text-[96px] text-white font-[520] font-san mb-[32px] ">
            <div>数学，</div>
            <div>如此简单</div>
          </div>

          <div className="h-[451px] w-[582px] flex-col px-[40px]  pt-[40px] border-[1px] rounded-[21px] border-[#1F2A3D] ">
            <div className="relative h-full overflow-hidden ">
              <div
                className={clsx("absolute flex h-full top-[0px] transition-transform duration-300",currentStep === 0 ? 'translate-x-[0px]' : currentStep === 1 ? '-translate-x-[500px]' : '-translate-x-[1001px]')}
                
                // style={{ transform: `translateX(-${currentStep * 500}px)` }}
              >
                {/* 登录 */}
                <div className="flex-shrink-0">
                  <div className="w-[500px] h-[67px] flex justify-center content-center items-center bg-[#1F2A3D] rounded-[12px] ">
                    <div className="h-[25px] w-[25px] mr-[12px] bg-[url('@/assets/images/GithubIcons.png')] bg-no-repeat bg-cover bg-center"></div>
                    <div className="text-[#FFFFFF] text-[24px] ">
                      使用Github继续
                    </div>
                  </div>
                  <div className="w-[500px] h-[57px] text-[20px] text-[#94A3B8] text-center  flex justify-center content-center items-center relative before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2 before:left-[0px] before:h-[1px] before:w-[212px] before:bg-[#1F2A3D]  after:content-[''] after:absolute after:top-1/2 after:-translate-y-1/2 after:right-[0px] after:h-[1px] after:w-[212px] after:bg-[#1F2A3D]">
                    或者
                  </div>
                  <div className="w-[500px] flex justify-center content-center items-center  mb-[32px] ">
                    
                    <LoginForm
                      onStepChange={goToStep}
                      currentStep={currentStep}
                    />
                  </div>
                  <div className="text-[#94A3B8] text-[20px] text-center">
                    继续即同意《用户协议》和《隐私协议》
                  </div>
                </div>
                {/* 邮箱链接 */}
                <div className="w-[502px] flex-col flex-shrink-0">
                  <div className="h-[52px] w-[54px] mx-auto bg-[url('@/assets/images/email.png')] bg-no-repeat bg-contain bg-center "></div>
                  <div className="h-[32px] text-[24px] mt-[25px] font-[380] text-white text-center">
                    点击发送到以下邮箱的链接以继续
                  </div>
                  <div className="h-[32px] text-[32px] mt-[25px] font-[520] text-white text-center">
                    example@xxx.com
                  </div>
                  <div className="h-[32px] text-[20px]  mt-[84px] font-[380] text-[#94A3B8] text-center flex justify-center">
                    <div>在另外的浏览器中登录？</div>
                    <div className="cursor-pointer hover:underline" onClick={()=>{goToStep(2)}}>
                      输入验证码
                    </div>
                  </div>
                  <div className="h-[32px] text-[20px]  mt-[32px] font-[380] text-[#94A3B8] text-center flex justify-center">
                    <div>收件箱中没有验证码？</div>
                    <div className="cursor-pointer hover:underline" onClick={()=>{goToStep(0)}}>
                      重新获取验证码
                    </div>
                  </div>
                </div>
                {/* 验证码 */}
                <div className="w-[500px] flex-col flex-shrink-0 ">
                  <div className="h-[32px] text-[24px]  font-[380] text-white text-center">
                    已有验证码？
                  </div>
                  <div className="h-[32px] text-[24px] mt-[25px] font-[380] text-white text-center">
                    输入发送到以下邮箱的验证码以继续
                  </div>
                  <div className="h-[32px] text-[32px] mt-[2px] font-[520] text-white text-center">
                    example@xxx.com
                  </div>
                  <div className="mt-[25px]">
                    <VerifyForm />
                  </div>
                  <div className="h-[32px] text-[20px]  mt-[32px] font-[380] text-[#94A3B8] text-center flex justify-center">
                    <div>收件箱中没有验证码？</div>
                    <div className="cursor-pointer hover:underline" onClick={()=>{goToStep(0)}}>
                      重新获取验证码
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右半边 */}
        <div className="w-1/2 bg-[#0F1729] m-[35px] rounded-[32px] mt-[32px]"></div>
      </div>
    </div>
  );
}

export default Home;
