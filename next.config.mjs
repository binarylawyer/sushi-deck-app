/** @type {import('next').NextConfig} */
const nextConfig = {
  // The kit ships TypeScript source (no build step), so Next must transpile it.
  transpilePackages: ["@binarylawyer/sushi-deck"],
};

export default nextConfig;
