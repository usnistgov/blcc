{
    description = "BLCC react frontend SPA";

    inputs = {
        nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
        flake-utils.url = "github:numtide/flake-utils";
        pnpm2nix.url = "github:LukeDonmoyer/pnpm2nix-nzbr?ref=version-9";
    };

    outputs = {self, nixpkgs, flake-utils, pnpm2nix}:
        flake-utils.lib.eachSystem [ "x86_64-linux" ] (system:
        let
            pkgs = import nixpkgs {
                inherit system;
            };

            blcc-frontend = pnpm2nix.packages.${system}.mkPnpmPackage {
                src = ./.;
            };
        in {
            packages = {
                inherit blcc-frontend;
                default = blcc-frontend;
            };
        });
}