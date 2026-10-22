{
  description = "Personal blog development environment";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = { nixpkgs, ... }:
    let
      systems = [ "aarch64-darwin" "x86_64-darwin" "aarch64-linux" "x86_64-linux" ];
    in
    {
      devShells = nixpkgs.lib.genAttrs systems (system: {
        default =
        let
          pkgs = nixpkgs.legacyPackages.${system};
          nodejs = pkgs.callPackage ./nix/nodejs.nix { };
        in pkgs.mkShell {
          packages = [
            nodejs
            (pkgs.pnpm.override { nodejs-slim = nodejs; })
            pkgs.git
          ];

          shellHook = ''
            echo "Astro development environment loaded"
            echo "Node.js: $(node --version)"
            echo "pnpm: $(pnpm --version)"
            echo "Git: $(git --version)"
          '';
        };
      });
    };
}
