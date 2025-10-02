import { useMutation } from "@tanstack/react-query";
import { login, register } from "../service/service";

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
