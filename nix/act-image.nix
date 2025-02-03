{
  stdenv,
  dockerTools,
}:
let
  baseImage = dockerTools.pullImage {
    imageName = "catthehacker/ubuntu";
    imageDigest = "sha256:89d7516beca06bf92fe76033330dec490772a606dc35d0d9cf2946f92bdf8380";
    hash =
      {
        aarch64-linux = "sha256-Qc427OdSCu+XFQymu7qe6k19eED3496nca4XBekGDz0=";
        x86_64-linux = "sha256-LiTvl8umTtwXcrR/PCRQKdl4fTs+H1KiFLMOErVuDgY=";
      }
      .${stdenv.system};
    finalImageName = "catthehacker/ubuntu";
    finalImageTag = "act-24.04";
  };
in
dockerTools.buildImage {
  name = "act-ubuntu";
  fromImage = baseImage;
  config.Env = [
    # Replace Node path to 20.*
    "PATH=/opt/acttoolcache/node/20.18.1/arm64/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin"
  ];
}
