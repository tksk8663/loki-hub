セキュリティ上の理由から、ログファイルは必ず ./logs ディレクトリに出力してください。
Deno はファイルアクセスに厳格な権限モデルを採用しており、--allow-write=./logs のように出力先を制限しています。
そのため、ログの出力先は ./logs に統一する必要があります。

For security reasons, all log files must be written to the ./logs directory.
Deno enforces a strict permission model for file system access, and we explicitly grant write access only to ./logs using --allow-write=./logs.
Therefore, please make sure that all log outputs are directed to this location.
