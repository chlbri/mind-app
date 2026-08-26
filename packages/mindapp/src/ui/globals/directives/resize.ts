import { useFlow } from '../../components/FlowChart.context';

/**
 * Creates a ResizeObserver hook attached to the node content container element,
 * dispatching RESIZE events to update node dimensions and edge positioning in
 * real-time.
 *
 * @param id - Unique identifier of the flowchart node.
 *
 * @returns Ref callback attaching and cleaning up the observer on unmount.
 */
export const resize = (id: string) => (el: HTMLDivElement) => {
  const service = useFlow();

  const resize = new ResizeObserver(entries => {
    const entry = entries[0].target;
    if (!entry) return;

    const width = entry.clientWidth;
    const height = entry.clientHeight;

    if (width > 0 && height > 0) {
      service.send({ type: 'RESIZE', payload: { id, size: { width, height } } });
    }
  });

  resize.observe(el);

  return () => {
    resize.unobserve(el);
    resize.disconnect();
  };
};
