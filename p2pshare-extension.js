(function(Scratch) {
  function registerWhenReady() {
    const client = new WebTorrent();
    let latestTorrent = null;
    let latestContent = "";

    class P2PShare {
      getInfo() {
        return {
          id: 'p2pshare',
          name: 'P2P Share',
          blocks: [
            {
              opcode: 'uploadFile',
              blockType: Scratch.BlockType.COMMAND,
              text: 'uploader un fichier'
            },
            {
              opcode: 'getMagnetLink',
              blockType: Scratch.BlockType.REPORTER,
              text: 'magnet link du fichier'
            },
            {
              opcode: 'downloadFromMagnet',
              blockType: Scratch.BlockType.COMMAND,
              text: 'télécharger depuis magnet [MAGNET]',
              arguments: {
                MAGNET: {
                  type: Scratch.ArgumentType.STRING,
                  defaultValue: 'magnet:?xt=...'
                }
              }
            },
            {
              opcode: 'getDownloadedContent',
              blockType: Scratch.BlockType.REPORTER,
              text: 'contenu du fichier'
            }
          ]
        };
      }

      uploadFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            client.seed(file, torrent => {
              latestTorrent = torrent;
              console.log("Seeded:", torrent.magnetURI);
            });
          }
        };
        input.click();
      }

      getMagnetLink() {
        return latestTorrent ? latestTorrent.magnetURI : '';
      }

      downloadFromMagnet(args) {
        client.add(args.MAGNET, torrent => {
          const file = torrent.files[0];
          file.getBlob((err, blob) => {
            if (err) {
              console.error("Erreur:", err);
              return;
            }
            const reader = new FileReader();
            reader.onload = () => {
              latestContent = reader.result;
            };
            reader.readAsText(blob);
          });
        });
      }

      getDownloadedContent() {
        return latestContent || '';
      }
    }

    Scratch.extensions.register(new P2PShare());
  }

  if (!window.WebTorrent) {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/webtorrent@latest/webtorrent.min.js";
    script.onload = registerWhenReady;
    document.head.appendChild(script);
  } else {
    registerWhenReady();
  }
})(Scratch);
