import { login, register } from "@/service/auth";
import { useMutation } from "@tanstack/react-query";


export const useLogin = () => {
  return useMutation({
    mutationFn: login,
  });
};
export const useRegister = () => {
  return useMutation({
    mutationFn: register,
  });
};
