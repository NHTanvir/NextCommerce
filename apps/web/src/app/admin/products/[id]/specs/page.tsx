'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  useGetProductSpecsQuery,
  useSetSpecMutation,
  useDeleteSpecMutation,
} from '@/store/api/product-specs.api';
import { useGetProductByIdQuery } from '@/store/api/catalog.api';
import styles from './specs-editor.module.scss';

interface NewSpecForm {
  key: string;
  value: string;
  group: string;
}

const EMPTY_FORM: NewSpecForm = { key: '', value: '', group: '' };

export default function AdminProductSpecsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: product } = useGetProductByIdQuery(id);
  const { data: specs = [], isLoading } = useGetProductSpecsQuery(id);
  const [setSpec, { isLoading: saving }] = useSetSpecMutation();
  const [deleteSpec] = useDeleteSpecMutation();

  const [form, setForm] = useState<NewSpecForm>(EMPTY_FORM);
  const [msg, setMsg] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<NewSpecForm>(EMPTY_FORM);

  const groups = Array.from(new Set(specs.map((s) => s.group ?? 'General')));

  const showMsg = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 3000);
  };

  const handleAdd = async () => {
    if (!form.key || !form.value) return;
    try {
      await setSpec({
        productId: id,
        key: form.key.trim(),
        value: form.value.trim(),
        group: form.group.trim() || undefined,
      }).unwrap();
      setForm(EMPTY_FORM);
      showMsg('Spec saved.');
    } catch {
      showMsg('Failed to save spec.');
    }
  };

  const handleEditSave = async (specId: string) => {
    try {
      await setSpec({
        productId: id,
        key: editForm.key.trim(),
        value: editForm.value.trim(),
        group: editForm.group.trim() || undefined,
      }).unwrap();
      setEditingId(null);
      showMsg('Spec updated.');
    } catch {
      showMsg('Failed to update spec.');
    }
  };

  const handleDelete = async (specId: string, key: string) => {
    if (!confirm(`Delete spec "${key}"?`)) return;
    try {
      await deleteSpec({ productId: id, specId }).unwrap();
      showMsg('Spec deleted.');
    } catch {
      showMsg('Failed to delete.');
    }
  };

  const startEdit = (spec: typeof specs[0]) => {
    setEditingId(spec.id);
    setEditForm({
      key: spec.key,
      value: spec.value,
      group: spec.group ?? '',
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link href={`/admin/products/${id}`} className={styles.backLink}>
          ← Edit Product
        </Link>
        <div>
          <h1 className={styles.heading}>Specifications</h1>
          {product && <p className={styles.sub}>{product.title}</p>}
        </div>
      </div>

      {msg && <div className={styles.msgBox}>{msg}</div>}

      {/* Add new spec */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Add Specification</h2>
        <div className={styles.addRow}>
          <input
            className={styles.input}
            placeholder="Key (e.g. Weight)"
            value={form.key}
            onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
          />
          <input
            className={styles.input}
            placeholder="Value (e.g. 280g)"
            value={form.value}
            onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
          />
          <input
            className={styles.input}
            placeholder="Group (optional)"
            value={form.group}
            onChange={(e) => setForm((f) => ({ ...f, group: e.target.value }))}
          />
          <button
            className="btn btn--primary"
            onClick={handleAdd}
            disabled={saving || !form.key || !form.value}
          >
            {saving ? 'Saving…' : 'Add'}
          </button>
        </div>
      </section>

      {/* Specs list */}
      {isLoading ? (
        <div className={styles.loadingText}>Loading specs…</div>
      ) : specs.length === 0 ? (
        <div className={styles.empty}>
          <p>No specifications yet. Add some above.</p>
        </div>
      ) : (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>
            Existing Specs
            <span className={styles.count}>{specs.length}</span>
          </h2>

          {groups.map((group) => {
            const groupSpecs = specs.filter((s) => (s.group ?? 'General') === group);
            return (
              <div key={group} className={styles.group}>
                <h3 className={styles.groupName}>{group}</h3>
                <div className={styles.specTable}>
                  {groupSpecs.map((spec) =>
                    editingId === spec.id ? (
                      <div key={spec.id} className={styles.specRowEdit}>
                        <input
                          className={styles.input}
                          value={editForm.key}
                          onChange={(e) => setEditForm((f) => ({ ...f, key: e.target.value }))}
                        />
                        <input
                          className={styles.input}
                          value={editForm.value}
                          onChange={(e) => setEditForm((f) => ({ ...f, value: e.target.value }))}
                        />
                        <input
                          className={styles.input}
                          value={editForm.group}
                          onChange={(e) => setEditForm((f) => ({ ...f, group: e.target.value }))}
                          placeholder="Group"
                        />
                        <div className={styles.rowActions}>
                          <button
                            className="btn btn--primary btn--sm"
                            onClick={() => handleEditSave(spec.id)}
                          >
                            Save
                          </button>
                          <button
                            className="btn btn--ghost btn--sm"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div key={spec.id} className={styles.specRow}>
                        <span className={styles.specKey}>{spec.key}</span>
                        <span className={styles.specValue}>{spec.value}</span>
                        <div className={styles.rowActions}>
                          <button
                            className={styles.editBtn}
                            onClick={() => startEdit(spec)}
                          >
                            Edit
                          </button>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => handleDelete(spec.id, spec.key)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}

      <div className={styles.hint}>
        <p>Specs are displayed on the product page in the Specifications section.</p>
        <p>Use groups to organize related specs (e.g. "Physical", "Technical", "Material").</p>
      </div>
    </div>
  );
}
