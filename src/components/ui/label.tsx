'use client';

import * as LabelPrimitive from '@radix-ui/react-label';
import * as React from 'react';

function Label({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>) {
  return <LabelPrimitive.Root className={className} {...props} />;
}

export { Label };
