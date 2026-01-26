{
  description = "Personal blog with Astro, MDX, Rust, and Tailwind";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, flake-utils, rust-overlay }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        overlays = [ (import rust-overlay) ];
        pkgs = import nixpkgs {
          inherit system overlays;
        };
        
        rustToolchain = pkgs.rust-bin.stable.latest.default.override {
          extensions = [ "rust-src" "rust-analyzer" ];
          targets = [ "wasm32-unknown-unknown" ];
        };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_24
            pnpm
            
            rustToolchain
            wasm-pack
            wasm-bindgen-cli
            
            # ビルドツール
            pkg-config
            openssl
            
            git
          ];

          shellHook = ''
            echo "🚀 Blog development environment loaded!"
            echo "Node.js: $(node --version)"
            echo "pnpm: $(pnpm --version)"
            echo "Rust: $(rustc --version)"
            echo ""
            echo "Run 'pnpm create astro@latest' to initialize Astro project"
          '';
          
          # 環境変数の設定
          RUST_SRC_PATH = "${rustToolchain}/lib/rustlib/src/rust/library";
        };
      }
    );
}
