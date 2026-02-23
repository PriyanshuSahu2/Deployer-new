import {
  forgotPassword,
  getMe,
  login,
  register,
  resetPassword,
} from '@/service/auth';
import { useMutation, useQuery } from '@tanstack/react-query';

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

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: forgotPassword,
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: resetPassword,
  });
};

export const useGetMe = () => {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => getMe().then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });
};
