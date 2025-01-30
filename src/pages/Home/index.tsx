import { getAssetsFile } from "@/utils/imgUtils";
interface HomeProps {
  t: (key: string) => string;
}

function Home({ t }: HomeProps) {
  return (
    <div>
      <div className="h-screen w-screen bg-[#020817] flex">
        {/* 左半边 */}
        <div className="flex-col w-1/2 ml-[182px] mt-[86px] ">
          <div className="flex">
            <div className="h-[48.25px] w-[27.58px] mr-[25.42px] mb-[64px]">
              <img src={getAssetsFile("Logo.png")} alt="" />
            </div>
            <div className="h-[75px] w-[226px]">
              <img src={getAssetsFile("Mathora.png")} alt="" />
            </div>
          </div>
          <div className="text-[96px] text-white font-[520] font-san mb-[32px] ">
            <div>数学，</div>
            <div>如此简单</div>
          </div>
          <div className="h-[451px] w-[580px] flex-col p-[40px] border-[1px] rounded-[21px] border-[#1F2A3D] ">
            <div className="w-[500px] h-[67px] flex justify-center content-center items-center bg-[#1F2A3D] rounded-[12px] ">
              <div className="h-[25px] w-[25px] mr-[12px]">
                <img src={getAssetsFile("GithubIcons.png")} alt="" />
              </div>
              <div className="text-[#FFFFFF] text-[24px] ">使用Github继续</div>
            </div>
            <div className="w-[500px] h-[57px] font-[20px] text-[#94A3B8] text-center  flex justify-center content-center items-center">
              或者
            </div>
            <div className="w-[500px] h-[67px] flex justify-center content-center items-center border-[#1F2A3D] border-[1px] rounded-[12px] mb-[32px] ">
              <div className="text-[#94A3B8] text-[24px] ">请输入邮箱</div>
            </div>
            <div className="w-[500px] h-[67px] flex justify-center content-center items-center bg-[#3C83F6] rounded-[12px] ">
              <div className="text-[#FFFFFF] text-[24px] ">使用邮箱继续</div>
            </div>
            <div className="text-[#94A3B8] text-[20px] text-center">继续即同意《用户协议》和《隐私协议》</div>
          </div>
        </div>

        {/* 右半边 */}
        <div className="w-1/2 bg-[#0F1729] m-[35px] rounded-[32px]"></div>
      </div>
    </div>
  );
}

export default Home;
