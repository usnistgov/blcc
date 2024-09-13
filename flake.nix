{
  description = "BLCC";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";

    # Rust inputs
    crane = {
      url = "github:ipetkov/crane";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs = {
        nixpkgs.follows = "nixpkgs";
      };
    };

    # PNPM inputs
    pnpm2nix.url = "github:LukeDonmoyer/pnpm2nix-nzbr";
  };

  outputs = { self, nixpkgs, flake-utils, pnpm2nix, crane, rust-overlay, ... }:
    flake-utils.lib.eachSystem [ "x86_64-linux" ] (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [ (import rust-overlay) ];
        };

        # Rust backend
        craneLib = crane.mkLib pkgs;

        sqlFilter = path: _type: builtins.match ".*sql$" path != null;
        sqlOrCargoFilter = path: type: (sqlFilter path type) || (craneLib.filterCargoSources path type);

        backend = craneLib.buildPackage {
          nativeBuildInputs = with pkgs; [ pkg-config ];
          buildInputs = with pkgs; [ postgresql openssl ];

          src = pkgs.lib.cleanSourceWith {
            src = craneLib.path ./backend;
            filter = sqlOrCargoFilter;
          };

          strictDeps = true;

          #fixes issues related to openssl
          OPENSSL_DIR = "${pkgs.openssl.dev}";
          OPENSSL_LIB_DIR = "${pkgs.openssl.out}/lib";
          OPENSSL_INCLUDE_DIR = "${pkgs.openssl.dev}/include/";
        };

        # PNPM frontend
        frontend = pnpm2nix.packages.${system}.mkPnpmPackage {
          src = ./frontend;
          extraBuildInputs = [ pkgs.cypress ];
        };

        # Final contents
        blcc = pkgs.stdenv.mkDerivation {
          name = "contents";
          src = ./.;
          buildInputs = [ backend frontend ];

          installPhase = ''
            mkdir -p $out/blcc/
            cp ${backend}/bin/backend $out/blcc/

            mkdir -p $out/blcc/public/
            cp -r ${frontend}/* $out/blcc/public/
          '';
        };

        # Docker image
        docker = pkgs.dockerTools.buildLayeredImage {
          name = "BLCC";
          tag = "latest";
          contents = [ blcc ];
          config = {
            Cmd = [ "./blcc/backend" ];
          };
        };
      in
      {
        packages = {
          inherit docker backend frontend blcc;
          default = docker;
        };

        devShells.system.default = pkgs.mkShell {
          packages = with pkgs; [ openssl postgresql ];

          shellHook = ''
            echo "Setting up dev shell"
          '';

          #fixes issues related to openssl
          OPENSSL_DIR = "${pkgs.openssl.dev}";
          OPENSSL_LIB_DIR = "${pkgs.openssl.out}/lib";
          OPENSSL_INCLUDE_DIR = "${pkgs.openssl.dev}/include/";
        };
      });
}
