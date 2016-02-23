  DiffParser.prototype.generateDiffJson = function(diffInput, config) {
        .replace(/\r\n?/g, '\n')
    var copyFrom = /^copy from "?(.+?)"?/;
    var copyTo = /^copy to "?(.+?)"?/;
    var renameFrom = /^rename from "?(.+?)"?/;
    var renameTo = /^rename to "?(.+?)"?/;
      } else if (currentFile && !currentFile.oldName && (values = getSrcFilename(line, config))) {
      } else if (currentFile && !currentFile.newName && (values = getDstFilename(line, config))) {
  function getSrcFilename(line, cfg) {
    var prefixes = ["a\\/", "i\\/", "w\\/", "c\\/", "o\\/"];

    if (cfg.srcPrefix) prefixes.push(cfg.srcPrefix);

    return _getFilename('---', line, prefixes);
  }

  function getDstFilename(line, cfg) {
    var prefixes = ["b\\/", "i\\/", "w\\/", "c\\/", "o\\/"];

    if (cfg.dstPrefix) prefixes.push(cfg.dstPrefix);

    return _getFilename('\\+\\+\\+', line, prefixes);
  }

  function _getFilename(linePrefix, line, prefixes) {
    var prefixesStr = prefixes.join("|");
    return new RegExp('^' + linePrefix + ' "?(?:' + prefixesStr + ')(.+?)"?$').exec(line);
  }
