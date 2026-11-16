export default (u) => {
  const v = u.toObject();
  delete v.password;
  return v;
};
