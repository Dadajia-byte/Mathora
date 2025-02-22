import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
interface LoginFormProps {
  onStepChange: (step: number) => void;
  currentStep: number;
}
// 表单规则
const formSchema = z.object({
  useremail: z.string().min(2, {
    message: "请输入正确的邮箱",
  }),
});

export function LoginForm({onStepChange}:LoginFormProps) {
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      useremail: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    onStepChange(1);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full h-full ">
        <FormField
          control={form.control}
          name="useremail"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="请输入邮箱"
                  {...field}
                  className="w-full box-border h-[67px] border-[#1F2A3D] border-[1px] rounded-[12px] text-[#94A3B8] text-[24px] placeholder:text-[#94A3B8] placeholder:text-[24px]"
                />
              </FormControl>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full h-[67px] mt-[25px] flex justify-center content-center items-center bg-[#3C83F6] rounded-[12px] text-[#FFFFFF] text-[24px] hover:bg-sky-700"
        >
          使用邮箱继续
        </Button>
      </form>
    </Form>
  );
}
//