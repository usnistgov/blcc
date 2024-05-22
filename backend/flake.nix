{
    description = "BLCC actix server";

    inputs = {
        nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
        crane = {
            url = "github:ipetkov/crane";
            inputs.nixpkgs.follows = "nixpkgs";
        };
        flake-utils.url = "github:numtide/flake-utils";
        rust-overlay = {
            url = "github:oxalica/rust-overlay";
            inputs = {
                nixpkgs.follows = "nixpkgs";
                flake-utils.follows = "flake-utils";
            };
        };
    };

    outputs = { self, nixpkgs, crane, flake-utils, rust-overlay, ... }:
        flake-utils.lib.eachSystem [ "x86_64-linux" ] (system:
        let
            pkgs = import nixpkgs {
                inherit system;
                overlays = [ (import rust-overlay) ];
            };

            craneLib = crane.mkLib pkgs;

            sqlFilter = path: _type: builtins.match ".*sql$" path != null;
            sqlOrCargoFilter = path: type:
                (sqlFilter path type) || (craneLib.filterCargoSources path type);

            blcc-backend = craneLib.buildPackage {
                nativeBuildInputs = with pkgs; [
                    pkg-config
                ];

                buildInputs = with pkgs; [
                    postgresql
                    openssl
                ];

                src = pkgs.lib.cleanSourceWith {
                  src = craneLib.path ./.;
                  filter = sqlOrCargoFilter;
                };

                strictDeps = true;

                #fixes issues related to openssl
                OPENSSL_DIR = "${pkgs.openssl.dev}";
                OPENSSL_LIB_DIR = "${pkgs.openssl.out}/lib";
                OPENSSL_INCLUDE_DIR = "${pkgs.openssl.dev}/include/";
            };

            docker = pkgs.dockerTools.buildLayeredImage {
                name = "BLCC";
                tag = "latest";
                contents = [ blcc-backend ];
                config = {
                    Cmd = [ "${blcc-backend}/bin/backend" ];
                };
            };
        in
        rec {
            checks = {
                inherit blcc-backend;
            };

            devShells.default = craneLib.devShell {
                checks = self.checks.${system};

                inputsFrom = [ blcc-backend ];

                buildInputs = with pkgs; [
                    pkg-config
                    postgresql
                    openssl
                ];
            };

            packages = {
                inherit blcc-backend docker;
                default = blcc-backend;
            };
        });
}