import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, Modal,
  ActivityIndicator, StyleSheet, TextInput, ScrollView,
} from 'react-native';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    maxHeight: '90%',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#0F766E',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  sectionPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  sectionPillActive: {
    backgroundColor: '#0F766E',
    borderColor: '#0F766E',
  },
  sectionPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  sectionPillTextActive: {
    color: 'white',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    color: '#111827',
    marginBottom: 12,
  },
  studentList: {
    flexGrow: 0,
    maxHeight: 360,
    marginBottom: 12,
  },
  studentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FAFAFA',
    marginBottom: 6,
    borderRadius: 8,
  },
  studentInfo: { flex: 1 },
  studentName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F766E',
    marginBottom: 2,
  },
  studentMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  enrollBtn: {
    backgroundColor: '#0F766E',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  enrollBtnText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyBox: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 4,
  },
  closeBtn: {
    marginTop: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
});

export function AddStudentModal({
  visible,
  sectionId,
  sectionName,
  sections = [],
  onSectionChange,
  onClose,
  onEnroll,
  apiBaseUrl,
  authToken,
}) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [enrollingId, setEnrollingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch whenever the modal opens or the selected section changes
  useEffect(() => {
    if (visible && sectionId) {
      fetchAvailableStudents(sectionId);
    }
  }, [visible, sectionId]);

  const fetchAvailableStudents = async (id) => {
    if (!id) {
      setError('No section selected.');
      return;
    }
    setLoading(true);
    setError(null);
    setStudents([]);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const response = await fetch(
        `${apiBaseUrl}/api/v1/enrollments/available?sectionId=${encodeURIComponent(id)}`,
        { headers }
      );
      const data = await response.json();
      if (data.success) {
        setStudents(data.data ?? []);
      } else {
        setError(data.error?.message || 'Failed to load students');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  // Deduplicate sections by id before rendering pills
  const uniqueSections = useMemo(() => {
    const seen = new Set();
    return sections.filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
  }, [sections]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    return students.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  const handleEnroll = async (studentId, studentNameVal) => {
    setEnrollingId(studentId);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const response = await fetch(`${apiBaseUrl}/api/v1/enrollments/enroll`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ studentId, sectionId }),
      });
      const data = await response.json();
      if (data.success) {
        onEnroll(studentId, studentNameVal);
        setStudents((prev) => prev.filter((s) => s.id !== studentId));
      } else {
        setError(data.error?.message || 'Enrollment failed');
      }
    } catch (err) {
      setError(err?.message ?? 'Network error');
    } finally {
      setEnrollingId(null);
    }
  };

  const handleSectionPress = (section) => {
    setSearchQuery('');
    if (onSectionChange) onSectionChange(section);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.header}>Add Students</Text>

          {/* Section selector */}
          {sections.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Select Class</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.sectionPillRow}>
                  {uniqueSections.map((sec) => {
                    const isActive = sec.id === sectionId;
                    return (
                      <TouchableOpacity
                        key={sec.id}
                        onPress={() => handleSectionPress(sec)}
                        style={[styles.sectionPill, isActive && styles.sectionPillActive]}
                      >
                        <Text style={[styles.sectionPillText, isActive && styles.sectionPillTextActive]}>
                          {sec.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </>
          )}

          {/* Current section label */}
          {sectionName ? (
            <Text style={{ fontSize: 13, color: '#374151', marginBottom: 10, fontWeight: '600' }}>
              Showing unenrolled students for: {sectionName}
            </Text>
          ) : null}

          {/* Search */}
          <TextInput
            placeholder="Search by name..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />

          {/* Error */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Loading */}
          {loading && (
            <View style={styles.emptyBox}>
              <ActivityIndicator size="large" color="#0F766E" />
              <Text style={{ marginTop: 8, color: '#6B7280' }}>Loading students…</Text>
            </View>
          )}

          {/* Empty state */}
          {!loading && filteredStudents.length === 0 && !error && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? `No students match "${searchQuery}"`
                  : 'All students in this grade are already enrolled, or none exist.'}
              </Text>
            </View>
          )}

          {/* Student list */}
          {!loading && filteredStudents.length > 0 && (
            <ScrollView
              style={styles.studentList}
              nestedScrollEnabled
              showsVerticalScrollIndicator
            >
              {filteredStudents.map((item) => (
                <View key={item.id} style={styles.studentItem}>
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{item.name}</Text>
                    <Text style={styles.studentMeta}>
                      {item.studentNumber} · {item.gradeLevel}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.enrollBtn, enrollingId === item.id && { opacity: 0.6 }]}
                    onPress={() => handleEnroll(item.id, item.name)}
                    disabled={enrollingId === item.id}
                  >
                    {enrollingId === item.id ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.enrollBtnText}>Add</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
