import React, { useState, useContext } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';

const ChildSwitcher = ({ onChildChange }) => {
  const { user, currentChild, setCurrentChild } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);

  if (!user || !user.children || user.children.length === 0) {
    return null;
  }

  const handleChildSelect = (child) => {
    setCurrentChild(child);
    if (onChildChange) {
      onChildChange(child);
    }
    setShowDropdown(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.switcherButton}
        onPress={() => setShowDropdown(!showDropdown)}
      >
        {currentChild?.avatar ? (
          <Image source={{ uri: currentChild.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {currentChild?.nickname?.charAt(0) || 'C'}
            </Text>
          </View>
        )}
        <Text style={styles.childName}>{currentChild?.nickname}</Text>
        <Text style={styles.dropdownIndicator}>▼</Text>
      </TouchableOpacity>

      {showDropdown && (
        <View style={styles.dropdown}>
          {user.children.map((child) => (
            <TouchableOpacity
              key={child.id}
              style={styles.dropdownItem}
              onPress={() => handleChildSelect(child)}
            >
              {child.avatar ? (
                <Image source={{ uri: child.avatar }} style={styles.dropdownAvatar} />
              ) : (
                <View style={styles.dropdownAvatarPlaceholder}>
                  <Text style={styles.dropdownAvatarText}>
                    {child.nickname.charAt(0)}
                  </Text>
                </View>
              )}
              <Text style={styles.dropdownItemText}>{child.nickname}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 10,
  },
  switcherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginRight: 8,
  },
  dropdownIndicator: {
    fontSize: 12,
    color: '#6c757d',
  },
  dropdown: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    paddingVertical: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  dropdownAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 12,
  },
  dropdownAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6c757d',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dropdownAvatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#495057',
  },
});

export default ChildSwitcher;