import { FormProvider } from "../../../Components/Form/FormProvider";

export default function Layout({ children }: any) {
  return <FormProvider>{children}</FormProvider>;
}