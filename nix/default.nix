{
  system ? builtins.currentSystem,
  npins ? import ./npins,
  pkgs ? import npins.nixpkgs {
    inherit system;
    overlays = [ ];
    config = { };
  },
  linuxPkgs ?
    if pkgs.stdenv.hostPlatform.isLinux then
      pkgs
    else
      import npins.nixpkgs {
        system = "${pkgs.stdenv.hostPlatform.uname.processor}-linux";
        overlays = [ ];
        config = { };
      },
}:
rec {
  act-image = linuxPkgs.callPackage ./act-image.nix { };
  act =
    let
      image-tag = "${act-image.buildArgs.name}:${act-image.imageTag}";
    in
    pkgs.writeShellApplication {
      name = "act";
      text = ''
        if ! docker inspect --format 'ok' "${image-tag}" > /dev/null 2>&1; then
          docker load --input ${act-image}
        fi
        ${pkgs.lib.getExe pkgs.act} -P ubuntu-latest=${image-tag} "$@"
      '';
    };
  build = pkgs.writeShellApplication {
    name = "build";
    runtimeInputs = [
      pkgs.bun
    ];
    text = ''
      bun build --install --target node --outdir=dist --minify --splitting --sourcemap src/*.js
    '';
  };
  check = pkgs.writeShellApplication {
    name = "check";
    runtimeInputs = [
      pkgs.actionlint
      pkgs.bun
      pkgs.nixfmt-rfc-style
    ];
    text = ''
      nixfmt --check -- ${builtins.toString ./.}/*.nix
      bun x xo
      actionlint
    '';
  };
  fmt = pkgs.writeShellApplication {
    name = "fmt";
    runtimeInputs = [
      pkgs.bun
      pkgs.nixfmt-rfc-style
    ];
    text = ''
      nixfmt -- ${builtins.toString ./.}/*.nix
      bun x xo --fix
    '';
  };
  shell = pkgs.mkShellNoCC {
    NPINS_DIRECTORY = builtins.toString ./npins;
    packages = [
      pkgs.npins
      pkgs.bun
      pkgs.actionlint
      pkgs.shellcheck
      pkgs.nixfmt-rfc-style

      act
      build
      check
      fmt
    ] ++ pkgs.lib.optional (pkgs.stdenv.isDarwin) pkgs.podman;
  };
}
