import json
import os
import base64
import re
import sys

def migrate(data_path, uploads_dir):
    if not os.path.exists(data_path):
        print(f"Data file not found: {data_path}")
        return

    os.makedirs(uploads_dir, exist_ok=True)
    
    with open(data_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    orig_size_mb = os.path.getsize(data_path) / (1024 * 1024)
    print(f"Original data.json size: {orig_size_mb:.2f} MB")

    total_extracted = 0
    total_bytes_saved = 0

    collections = ['users', 'qard_applications', 'loyalty_applications', 'products']
    photo_fields = ['nid_front_photo', 'nid_back_photo', 'user_photo', 'thumbnail', 'images']

    for col in collections:
        items = data.get(col, [])
        for item in items:
            item_id = item.get('id', 'item')
            for field in photo_fields:
                val = item.get(field)
                if not val:
                    continue

                if isinstance(val, list):
                    new_list = []
                    for idx, el in enumerate(val):
                        if isinstance(el, str) and (el.startswith('data:image/') or len(el) > 500):
                            new_url, saved = extract_and_save(el, uploads_dir, f"{col}_{item_id}_{field}_{idx}")
                            if new_url:
                                new_list.append(new_url)
                                total_extracted += 1
                                total_bytes_saved += saved
                            else:
                                new_list.append(el)
                        else:
                            new_list.append(el)
                    item[field] = new_list
                elif isinstance(val, str) and (val.startswith('data:image/') or len(val) > 500):
                    new_url, saved = extract_and_save(val, uploads_dir, f"{col}_{item_id}_{field}")
                    if new_url:
                        item[field] = new_url
                        total_extracted += 1
                        total_bytes_saved += saved

    with open(data_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    new_size_kb = os.path.getsize(data_path) / 1024
    print(f"Extracted {total_extracted} base64 images ({total_bytes_saved / (1024*1024):.2f} MB written to files in {uploads_dir})")
    print(f"New data.json size: {new_size_kb:.2f} KB (Reduced by {(1 - (new_size_kb / 1024) / orig_size_mb) * 100:.1f}%)")

def extract_and_save(data_str, uploads_dir, prefix):
    try:
        ext = '.jpg'
        b64_data = data_str
        if data_str.startswith('data:image/'):
            header, b64_data = data_str.split(';base64,', 1)
            if 'png' in header:
                ext = '.png'
            elif 'webp' in header:
                ext = '.webp'
            elif 'svg' in header:
                ext = '.svg'
            elif 'gif' in header:
                ext = '.gif'

        img_bytes = base64.b64decode(b64_data)
        clean_prefix = re.sub(r'[^a-zA-Z0-9_-]', '_', prefix)[:40]
        filename = f"{clean_prefix}{ext}"
        filepath = os.path.join(uploads_dir, filename)

        with open(filepath, 'wb') as f:
            f.write(img_bytes)

        return f"/uploads/{filename}", len(img_bytes)
    except Exception as e:
        print(f"Error saving {prefix}: {e}")
        return None, 0

if __name__ == '__main__':
    target_data = sys.argv[1] if len(sys.argv) > 1 else 'server/data.json'
    target_uploads = sys.argv[2] if len(sys.argv) > 2 else 'server/uploads'
    migrate(target_data, target_uploads)
