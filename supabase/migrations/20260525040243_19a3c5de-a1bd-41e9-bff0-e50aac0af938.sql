
revoke execute on function public.has_role(uuid, public.app_role) from anon, authenticated;
revoke execute on function public.get_user_company(uuid) from anon, authenticated;
revoke execute on function public.get_user_role(uuid) from anon, authenticated;
revoke execute on function public.handle_new_user() from anon, authenticated;
