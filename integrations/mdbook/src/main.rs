use std::io;

use mdbook_preprocessor::book::Book;
use mdbook_preprocessor::errors::Error;
use mdbook_preprocessor::Preprocessor;

struct DocslabCodeblock;

impl DocslabCodeblock {
    pub fn new() -> Self {
        Self
    }

    pub fn handle_preprocessing(&self) -> Result<(), Error> {
        let (ctx, book) = mdbook_preprocessor::parse_input(io::stdin())?;
        let out = self.run(&ctx, book)?;
        serde_json::to_writer(io::stdout(), &out)?;
        Ok(())
    }
}

impl mdbook_preprocessor::Preprocessor for DocslabCodeblock {
    fn name(&self) -> &str {
        "docslab"
    }

    fn run(
        &self,
        ctx: &mdbook_preprocessor::PreprocessorContext,
        book: Book,
    ) -> Result<Book, Error> {
        Ok(book)
    }
}

const DOCSLAB_JS_LOADER: &str =
    "document.addEventListener('DOMContentLoaded', (event) => { docslab.loadAll(); });";
const JS_FILEMAP: [(&str, &str); 1] = [("docslabl.js", DOCSLAB_JS_LOADER)];
const CUSTOM_HEADER: &str =
    "<script src=\"https://cdn.jsdelivr.net/npm/docslab@0.3.12/dist/index.all.js\"></script>";
const THEME_FILEMAP: [(&str, &str); 1] = [("head.hbs", CUSTOM_HEADER)];

fn main() {
    let args: Vec<String> = std::env::args().collect();
    if args.len() == 3 {
        if args[1] == "supports" && args[2] == "html" {
            std::process::exit(0);
        } else if args[1] == "install" {
            let base_path = std::path::Path::new(&args[2]);
            let bookconfig_path = base_path.join("book.toml");
            if !bookconfig_path.is_file() {
                eprintln!("Given path is not a valid mdBook book source");
                std::process::exit(1);
            }
            let bookconfig_raw = match std::fs::read_to_string(&bookconfig_path) {
                Ok(s) => s,
                Err(err) => {
                    eprintln!("Error while reading {}: {}", args[2], err);
                    std::process::exit(1);
                }
            };
            let mut bookconfig = match bookconfig_raw.parse::<toml_edit::DocumentMut>() {
                Ok(b) => b,
                Err(err) => {
                    eprintln!(
                        "Error parsing {} as TOML file: {}",
                        bookconfig_path.display(),
                        err
                    );
                    std::process::exit(1);
                }
            };

            if !bookconfig.contains_table("preprocessor") {
                bookconfig["preprocessor"] = toml_edit::table();
            }
            if !bookconfig["preprocessor"]
                .as_table()
                .unwrap()
                .contains_table("docslab")
            {
                bookconfig["preprocessor"]["docslab"] = toml_edit::table();
            }

            if !bookconfig.contains_table("output") {
                bookconfig["output"] = toml_edit::table();
            }
            if !bookconfig["output"]
                .as_table()
                .unwrap()
                .contains_table("html")
            {
                bookconfig["output"]["html"] = toml_edit::table();
            }
            if !bookconfig["output"]["html"]
                .as_table()
                .unwrap()
                .contains_key("additional-js")
            {
                bookconfig["output"]["html"]["additional-js"] =
                    toml_edit::value(toml_edit::Array::new());
            }
            let arr = bookconfig["output"]["html"]["additional-js"]
                .as_array_mut()
                .unwrap();
            let mut new_js_files = Vec::from(JS_FILEMAP.map(|x| x.0));
            for item in arr.iter() {
                for (index, new_js_file) in new_js_files.iter().enumerate() {
                    if &item.as_str().unwrap() == new_js_file {
                        new_js_files.remove(index);
                        break;
                    }
                }
                if new_js_files.is_empty() {
                    break;
                }
            }
            arr.extend(new_js_files);

            if let Err(err) = std::fs::write(bookconfig_path, bookconfig.to_string()) {
                eprintln!("Error updating target book.toml: {}", err);
                std::process::exit(1);
            }

            for file in JS_FILEMAP.iter() {
                let full_path = base_path.join(file.0);
                if !full_path.exists() {
                    if let Err(err) = std::fs::write(full_path, file.1) {
                        eprintln!("Error writing {}: {}", file.0, err);
                        std::process::exit(1);
                    }
                }
            }

            let theme_path = base_path.join("theme");
            if !theme_path.exists() {
                if let Err(err) = std::fs::create_dir(&theme_path) {
                    eprintln!("Error creating theme directory: {}", err);
                    std::process::exit(1);
                }
            }
            for file in THEME_FILEMAP.iter() {
                let full_path = theme_path.join(file.0);
                if full_path.exists() {
                    let mut current_theme_file = match std::fs::read_to_string(&full_path) {
                        Ok(s) => s,
                        Err(err) => {
                            eprintln!("Error while reading {}: {}", args[2], err);
                            std::process::exit(1);
                        }
                    };
                    if !current_theme_file.contains(file.1) {
                        current_theme_file.push_str(file.1);
                        if let Err(err) = std::fs::write(full_path, current_theme_file) {
                            eprintln!("Error writing {}: {}", file.0, err);
                            std::process::exit(1);
                        }
                    }
                } else {
                    if let Err(err) = std::fs::write(full_path, file.1) {
                        eprintln!("Error writing {}: {}", file.0, err);
                        std::process::exit(1);
                    }
                }
            }
        } else {
            std::process::exit(1);
        }
    } else if args.len() != 1 {
        eprintln!("Usage: mdbook-docslab [supports RENDERER | install PATH]");
        std::process::exit(1);
    } else {
        let dc = DocslabCodeblock::new();
        match dc.handle_preprocessing() {
            Ok(()) => std::process::exit(0),
            Err(err) => {
                eprintln!("{}", err);
                std::process::exit(1)
            }
        }
    }
}
