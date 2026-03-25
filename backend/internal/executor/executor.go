package executor

import (
	"archive/zip"
	"io"
	"os"
	"path/filepath"
)

func Unzip(src string) (string, error) {
	// Распаковываем в /root/tmp/<имя архива без .zip>
	base := filepath.Base(src)
	if len(base) > 4 && base[len(base)-4:] == ".zip" {
		base = base[:len(base)-4]
	}
	dest := "/root/tmp/" + base

	r, err := zip.OpenReader(src)
	if err != nil {
		return "", err
	}
	defer r.Close()

	if err := os.MkdirAll(dest, 0755); err != nil {
		return "", err
	}

	for _, f := range r.File {
		fpath := filepath.Join(dest, f.Name)

		if f.FileInfo().IsDir() {
			os.MkdirAll(fpath, f.Mode())
			continue
		}

		if err := os.MkdirAll(filepath.Dir(fpath), 0755); err != nil {
			return "", err
		}

		inFile, err := f.Open()
		if err != nil {
			return "", err
		}

		outFile, err := os.OpenFile(fpath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, f.Mode())
		if err != nil {
			inFile.Close()
			return "", err
		}

		_, err = io.Copy(outFile, inFile)
		inFile.Close()
		outFile.Close()

		if err != nil {
			return "", err
		}
	}

	return dest, nil
}
